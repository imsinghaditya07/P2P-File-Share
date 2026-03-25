from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import os
import json
import time
import string
import random
from upstash_redis import Redis

app = FastAPI()

# Fallback in-memory KV
memory_kv = {}

def get_kv():
    url = os.getenv('KV_REST_API_URL') or os.getenv('UPSTASH_REDIS_REST_URL')
    token = os.getenv('KV_REST_API_TOKEN') or os.getenv('UPSTASH_REDIS_REST_TOKEN')
    
    if url and token:
        try:
            return Redis(url=url, token=token)
        except Exception as e:
            print("Redis init failed:", e)
    return None

kv = get_kv()

def kv_setex(key, seconds, value):
    if kv:
        # upstash-redis uses standard redis commands
        kv.setex(key, seconds, value)
    else:
        memory_kv[key] = {
            'value': value,
            'expires': time.time() + seconds
        }

def kv_get(key):
    if kv:
        return kv.get(key)
    else:
        item = memory_kv.get(key)
        if not item: 
            return None
        if time.time() > item['expires']:
            del memory_kv[key]
            return None
        return item['value']

def kv_del(key):
    if kv:
        kv.delete(key)
    else:
        if key in memory_kv:
            del memory_kv[key]

@app.post("/api/rooms")
async def create_room(request: Request):
    try:
        room_id = ''.join(random.choices(string.ascii_letters + string.digits, k=10))
        key = f'room:{room_id}'
        
        room_data = {
            'created': int(time.time() * 1000),
            'active': True
        }
        
        kv_setex(key, 3600, json.dumps(room_data))
        
        app_url = os.getenv('NEXT_PUBLIC_APP_URL', 'http://localhost:3000')
        share_url = f'{app_url}/room/{room_id}'
        
        return JSONResponse({'roomId': room_id, 'shareUrl': share_url})
    except Exception as e:
        print(e)
        return JSONResponse({'error': 'Failed to create room'}, status_code=500)

@app.post("/api/signal")
async def post_signal(request: Request):
    try:
        body = await request.json()
        room_id = body.get('roomId')
        peer_id = body.get('peerId')
        type_ = body.get('type')
        payload = body.get('payload')
        
        if not room_id or not peer_id or not type_:
            return JSONResponse({'error': 'Missing params'}, status_code=400)
            
        key = f'signal:{room_id}:{peer_id}:{type_}'
        kv_setex(key, 300, json.dumps(payload))
        
        return JSONResponse({'ok': True})
    except Exception as e:
        print(e)
        return JSONResponse({'error': 'Invalid request'}, status_code=400)

@app.get("/api/signal")
async def get_signal(request: Request):
    try:
        room_id = request.query_params.get('room')
        peer_id = request.query_params.get('peer')
        type_ = request.query_params.get('type')
        
        if not room_id or not peer_id or not type_:
            return JSONResponse({'error': 'Missing params'}, status_code=400)
            
        key = f'signal:{room_id}:{peer_id}:{type_}'
        data = kv_get(key)
        
        if not data:
            return JSONResponse({'payload': None}, status_code=404)
            
        kv_del(key)
        
        payload = data
        if isinstance(data, str) and (data.startswith('{') or data.startswith('[')):
            try:
                payload = json.loads(data)
            except:
                pass
                
        return JSONResponse({'payload': payload})
    except Exception as e:
        print(e)
        return JSONResponse({'error': 'Internal Error'}, status_code=500)

from fastapi import FastAPI
from huawei_solar import AsyncHuaweiSolar, register_names as rn
import asyncio

app = FastAPI()

client: AsyncHuaweiSolar = None
slave_id = 0  # หรือ 1 ถ้า inverter ใช้ slave ID นี้

@app.on_event("startup")
async def startup_event():
    global client
    client = await AsyncHuaweiSolar.create(
        "192.168.1.139",  # IP ของ SUN2000
        6607,             # พอร์ตที่ใช้ (ค่าปกติของ Huawei คือ 6607)
        asyncio.Lock()    # update_lock (ต้องมี)
    )

@app.get("/active_power")
async def get_active_power():
    result = await client.get(rn.ACTIVE_POWER, slave_id)
    return {"active_power": result.value, "unit": "Watt"}

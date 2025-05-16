from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import shutil
import subprocess
import uuid

app = FastAPI()

# 添加 CORS 中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 在生产环境中，建议设置为具体的域名
    allow_credentials=False,  # 修改为 False，因为使用了通配符
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"]
)

@app.post("/convert")
async def convert_font(
    file: UploadFile = File(...),
    target_format: str = Form(...)
):
    # 保存上传的文件
    input_filename = f"input_{uuid.uuid4().hex}_{file.filename}"
    output_filename = f"output_{uuid.uuid4().hex}.{target_format}"
    with open(input_filename, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # 调用 convert_font.py 进行转换
    try:
        subprocess.run(
            ["python3", "convert_font.py", input_filename, output_filename],
            check=True
        )
    except subprocess.CalledProcessError:
        os.remove(input_filename)
        return JSONResponse(status_code=500, content={"error": "Font conversion failed"})

    # 返回转换后的文件
    response = FileResponse(output_filename, filename=output_filename)
    # 清理临时文件
    os.remove(input_filename)
    os.remove(output_filename)
    return response

@app.get("/")
def read_root():
    return {"message": "Font Converter API is running."}

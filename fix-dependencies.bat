@echo off
echo 正在安装必要的前端依赖...
cd frontend
call npm install --legacy-peer-deps
call npm install axios@1.6.0 @types/axios@0.14.0 @types/react@18.2.0 @types/react-dom@18.2.0 --save --legacy-peer-deps
echo 依赖安装完成！
pause 
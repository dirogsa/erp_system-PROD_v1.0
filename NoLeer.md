d:\Projects > netstat -ano | findstr LISTENING
d:\Projects > tasklist /FI "PID eq 7136" /FO TABLE
d:\Projects > tasklist /FI "PID eq 14896" /FO TABLE

taskkill /PID 7136 /F


PS D:\Projects> taskkill /PID 7136 /F
SUCCESS: The process with PID 7136 has been terminated.


venv\Scripts\activate && uvicorn main:app --reload
source venv/bin/activate && uvicorn main:app --reload

npm run dev


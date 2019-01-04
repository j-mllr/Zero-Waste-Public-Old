FROM python:3.7-alpine

RUN adduser -D nowaste

WORKDIR /home/nowaste

COPY requirements.txt requirements.txt
RUN python -m venv venv
RUN venv/bin/pip install -r requirements.txt
RUN venv/bin/pip install gunicorn
COPY nowaste nowaste 
COPY instance instance
COPY app.py boot.sh ./
RUN chmod +x boot.sh
RUN venv/bin/pip install gunicorn pymysql

RUN chown -R nowaste:nowaste ./
USER nowaste

EXPOSE 5000
ENTRYPOINT ["./boot.sh"]
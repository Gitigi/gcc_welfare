FROM alpine:3.10
RUN apk add --update --no-cache uwsgi-python3 postgresql-dev yarn
RUN apk add --update --no-cache --virtual .build-deps build-base linux-headers python3-dev

#install requirements
ADD requirement.txt /tmp/
RUN pip3 install --requirement /tmp/requirement.txt

RUN apk del .build-deps

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

ADD . .

CMD /bin/sh ./run.sh

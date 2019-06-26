#!/usr/bin sh
if case $DATABASE_URL in "postgres"*) true;; *) false;; esac; then
    echo "Waiting for postgres..."

    while ! nc -z db 5432; do
      sleep 0.1
    done

    echo "PostgreSQL started"
fi

python3 manage.py migrate --noinput
python3 manage.py collectstatic --noinput

uwsgi --vacuum --plugin python3 --enable-threads --thunder-lock\
    --ini uwsgi.ini:$(if [ ! -z $PRODUCTION ];then echo 'prod';fi;) & cd frontend && ln -s $NODE_PATH node_modules && yarn start
# python3 manage.py runserver & cd frontend && yarn start
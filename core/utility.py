import africastalking
from django.conf import settings
from django.core.paginator import Paginator
from rest_framework.response import Response
from rest_framework import status
import phonenumbers
from core.models import Member
import time,requests,hashlib

try:
    import urlparse
    from urllib import urlencode
except:
    import urllib.parse as urlparse
    from urllib.parse import urlencode


def send_message(messages,default_msg=None):
    destinationAddr = []
    messagePayload = [{"Text": default_msg + '\n-'}] if default_msg else []
    for message in messages:
        try:
            n = phonenumbers.parse(message['number'],'KE')
            if phonenumbers.is_valid_number(n):
                destinationAddr.append({
                        "MSISDN": phonenumbers.format_number(n, phonenumbers.PhoneNumberFormat.E164),
                        "LinkID": "",
                        "SourceID": "2"
                    })
                if not default_msg:
                    messagePayload.append({"Text": message['msg'] + '\n-'})
            else:
                print('failed to send to number',n)
        except(phonenumbers.NumberParseException):
            print('failed to send to number ',n)

    batchType = "0" if len(destinationAddr) == 1 else "1" if len(messagePayload) == 1 else "2"
    payload = {
        "AuthDetails": [
            {
                "UserID": settings.BIZSMS_USER_ID,
                "Token": hashlib.md5(settings.BIZSMS_PASSWORD.encode()).hexdigest(),
                "Timestamp": str(int(time.time()))
            }
        ],
        "SubAccountID": [
            "0"
        ],
        "MessageType": [
            "3"
        ],
        "BatchType": [batchType],
        "SourceAddr": [settings.BIZSMS_SENDER_ID],
        "MessagePayload": messagePayload,
        "DestinationAddr": destinationAddr
    }
    print(payload)
    return requests.post("http://api.bizsms.co.ke/submit2.php",json=payload)

def search_name(name):
    like_op = 'like' if 'sqlite' in settings.DATABASES['default']['ENGINE'].split('.')[-1] else 'ilike'
    names = name.split(' ')[:3]
    sql = ''
    args = []
    for i in names:
        sql += ' UNION ALL ' if len(sql) else ''
        sql += 'SELECT id FROM core_member WHERE (first_name '+like_op +' %s OR middle_name '+like_op +' %s  OR last_name '+like_op +' %s)'
        arg = '%s%%'%(i,)
        args += [arg,arg,arg]
    f = 'select count(id) count, id from (' + sql + ') a group by id order by count desc limit 10'
    return Member.objects.raw(f,args)
def add_params_to_url(url,params):
    url_parts = list(urlparse.urlparse(url))
    query = dict(urlparse.parse_qsl(url_parts[4]))
    query.update(params)
    url_parts[4] = urlencode(query)
    return urlparse.urlunparse(url_parts)


def paginate_list(values,page_number,url,size=8):
    pagination = Paginator(values,size)
    if int(page_number) not in pagination.page_range:
        return Response({"detail": "Invalid page."},status.HTTP_404_NOT_FOUND)
    page = pagination.page(page_number)
    response = {
        'count': pagination.count,
        'next': add_params_to_url(url,{'page': page.next_page_number()}) if page.has_next() else None,
        'previous': add_params_to_url(url,{'page': page.previous_page_number()}) if page.has_previous() else None,
        'results': page.object_list
    }
    return Response(response)

def paginate_query_by_field(query,page_number,url,field,size=8):
    page_number = int(page_number)
    if not query.count():
        if page_number == 1:
            return Response({
                'count': query.count(),
                'next': None,
                'previous': None,
                'results': list(query)
            })
        else:
            return Response({"detail": "Invalid page."},status.HTTP_404_NOT_FOUND)
    items = query.first()[field] - query.last()[field]
    item_index_start = (page_number-1) * size
    next_page = None
    previous_page = None
    results = []
    if items < 0:
        item_start = query.first()[field] + item_index_start
        if item_start > query.last()[field]:
            return Response({"detail": "Invalid page."},status.HTTP_404_NOT_FOUND)
        else:
            items_limit = item_start + size
            results = list(query.filter(**{field+'__gte': item_start,field+'__lt':items_limit}))
            if items_limit <= query.last()[field]:
                next_page = page_number + 1
            if (item_start - size) >= query.first()[field]:
                previous_page = page_number - 1
    else:
        item_start = query.first()[field] - item_index_start
        if item_start < query.last()[field]:
            return Response({"detail": "Invalid page."},status.HTTP_404_NOT_FOUND)
        else:
            items_limit = item_start - size
            results = list(query.filter(**{field+'__lte':item_start,field+'__gt':items_limit}))
            if items_limit >= query.last()[field]:
                next_page =  page_number + 1
            if (item_start + size) <= query.first()[field]:
                previous_page = page_number - 1
                
    print(items,item_start,next_page,previous_page)
    return Response({
        'count': query.count(),
        'next': add_params_to_url(url,{'page': next_page}) if next_page else None,
        'previous': add_params_to_url(url,{'page': previous_page}) if previous_page else None,
        'results': results
    })
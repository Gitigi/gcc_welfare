import africastalking
from django.core.paginator import Paginator
from rest_framework.response import Response
from rest_framework import status

try:
    import urlparse
    from urllib import urlencode
except:
    import urllib.parse as urlparse
    from urllib.parse import urlencode

def send_message(msg,number):
    if type(number) != list:
        number = [number]
    print('sending to',msg,number)
    # africastalking.initialize(username=settings.AFRICASTALKING_USERNAME,
    #     api_key=settings.AFRICASTALKING_API_KEY)
    # sms = africastalking.SMS
    # return sms.send(message=msg, recipients=[number])

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
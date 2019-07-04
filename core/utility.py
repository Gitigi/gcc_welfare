import africastalking
from django.core.paginator import Paginator
from rest_framework.response import Response

try:
    import urlparse
    from urllib import urlencode
except:
    import urllib.parse as urlparse
    from urllib.parse import urlencode

def send_message(msg,number):
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
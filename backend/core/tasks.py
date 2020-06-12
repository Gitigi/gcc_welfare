# Create your tasks here
from __future__ import absolute_import, unicode_literals

from django.conf import settings

from celery import shared_task
from core.models import SmsMessage

import phonenumbers
import time,requests,hashlib,random

from .celery_batches import Batches

@shared_task(base=Batches, flush_every=50, flush_interval=3)
def send_sms(batch):
    destinationAddr = []
    messagePayload = []
    for param in batch:
        id = param.args if type(param.args) == int else param.args[0] #The Batches base calls the task with inconsistent params when used with delay and apply
        sms_message = SmsMessage.objects.get(id=id)
        message = sms_message.get_message()
        try:
            n = phonenumbers.parse(message['mobile_no'],'KE')
            if phonenumbers.is_valid_number(n):
                destinationAddr.append({
                    "MSISDN": phonenumbers.format_number(n, phonenumbers.PhoneNumberFormat.E164),
                    "LinkID": "",
                    "SourceID": sms_message.id
                    })
                messagePayload.append({"Text": message['msg'] + '\n-'})
            else:
                print('failed to send to number',n)
        except(phonenumbers.NumberParseException):
            print('failed to send to number ',n)

    batchType = "0" if len(destinationAddr) == 1 else "2"
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
    response = requests.post("http://api.bizsms.co.ke/submit2.php",json=payload)
    data = response.json()
    for resp in data:
        sms_message = SmsMessage.objects.get(id=resp['SourceID'])
        sms_message.status_code = resp['ResponseCode']
        sms_message.status_desc = get_status_desc(resp['ResponseCode'])
        sms_message.save()

    print(data)
    return data

def get_status_desc(code):
    if code == '1001':
        return 'sent'
    elif code == '1002':
        return 'Invalid User ID'
    elif code == '1003':
        return 'Invalid Token'
    elif code == '1004':
        return 'Invalid Timestamp'
    elif code == '1005':
        return 'Invalid Source Address'
    elif code == '1006':
        return 'Invalid MSISDN'
    elif code == '1007':
        return 'Invalid Message Type'
    elif code == '1008':
        return 'User ID does not exist'
    elif code == '1009':
        return 'User of ID has been suspended'
    elif code == '1010':
        return 'Access Authentication or Authorization error'
    elif code == '1011':
        return 'Internal Error occured!'
    elif code == '1012':
        return 'Invalid Request'
    elif code == '1013':
        return 'Invalid Batch Type'
    elif code == '1014':
        return 'There are too many addresses'
    elif code == '1015':
        return 'Insufficient SMS Credit Units'
    elif code == '1016':
        return 'Sender ID does not exist'
    elif code == '1017':
        return 'Number is on DND list'
    else:
        return 'error'

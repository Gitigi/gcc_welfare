import africastalking

def send_message(msg,number):
    print('sending to',msg,number)
    # africastalking.initialize(username=settings.AFRICASTALKING_USERNAME,
    #     api_key=settings.AFRICASTALKING_API_KEY)
    # sms = africastalking.SMS
    # return sms.send(message=msg, recipients=[number])
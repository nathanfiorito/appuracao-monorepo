"""
Lambda Ingest: recebe POST da API, valida payload e publica uma mensagem SQS por QR.
Trigger: API Gateway (POST /boletins ou /boletins/qr).
"""


def handler(event, context):
    # TODO: validar payload, normalizar para uma mensagem por QR, publicar na SQS
    return {"statusCode": 202, "body": "Accepted"}

"""
Lambda Validar e Armazenar: processa mensagem SQS, valida formato/assinatura TSE, grava no DynamoDB.
Trigger: SQS (uma mensagem por QR).
"""


def handler(event, context):
    # TODO: parse TSE, validar hash/assinatura, gravar item em boletim_urna_registros
    return {}

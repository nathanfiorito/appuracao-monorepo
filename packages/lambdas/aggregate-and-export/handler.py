"""
Lambda Agregar e Exportar: lê DynamoDB, agrupa por boletim e município, gera JSON por cidade no S3.
Trigger: EventBridge Schedule (ex.: a cada 5 minutos).
"""


def handler(event, context):
    # TODO: ler boletim_urna_registros, agrupar por boletim/município, somar votos, PutObject por cidade
    return {}

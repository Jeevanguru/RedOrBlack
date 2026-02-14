# Dockerfile
FROM rabbitmq:3.11-management

# Enable delayed message plugin offline
RUN rabbitmq-plugins enable --offline rabbitmq_delayed_message_exchange

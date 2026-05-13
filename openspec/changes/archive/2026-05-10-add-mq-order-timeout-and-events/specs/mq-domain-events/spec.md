## ADDED Requirements

### Requirement: Domain event envelope
The system SHALL define a provider-neutral domain event envelope used by all MQ messages. Each event SHALL include `messageId`, `eventType`, `aggregateType`, `aggregateId`, `occurredAt`, and payload data.

#### Scenario: Create event with required metadata
- **WHEN** the system creates an `OrderCreatedEvent` for order ID 1001
- **THEN** the event contains a unique `messageId`, `eventType` of `OrderCreatedEvent`, `aggregateType` of `ORDER`, `aggregateId` of `1001`, and an `occurredAt` timestamp

### Requirement: RabbitMQ topology
The system SHALL define RabbitMQ topic exchanges, queues, and routing keys for order events, delayed order close, product events, and points issuing. Delayed order close SHALL use a TTL delay queue plus dead-letter exchange and SHALL NOT require the RabbitMQ delayed-message exchange plugin.

#### Scenario: RabbitMQ topology is configured at startup
- **WHEN** the backend application starts with RabbitMQ enabled
- **THEN** the required exchanges, queues, bindings, and routing keys are declared without manual broker setup

#### Scenario: Delayed close uses TTL and DLX
- **WHEN** the RabbitMQ topology is declared
- **THEN** the order timeout delay queue has TTL/dead-letter settings that route expired messages to the order-timeout consumer queue

### Requirement: Event publishing service
The system SHALL provide an event publishing service that serializes domain events as JSON and publishes them to RabbitMQ through configured routing keys.

#### Scenario: Publish domain event
- **WHEN** a product update succeeds and the service publishes `ProductChangedEvent`
- **THEN** the event is serialized as JSON and sent to the configured product event exchange with the product-changed routing key

### Requirement: Transaction-aware publishing
The system SHALL publish events that depend on local database changes only after the related transaction successfully commits.

#### Scenario: Rolled-back transaction does not publish event
- **WHEN** order creation fails and its transaction rolls back
- **THEN** no `OrderCreatedEvent` or delayed order-close message is published for that failed order

### Requirement: RabbitMQ configuration
The system SHALL externalize RabbitMQ connection settings and order timeout settings in Spring configuration, with development defaults and production environment-variable based values.

#### Scenario: Development RabbitMQ defaults are available
- **WHEN** the application runs with the `dev` profile
- **THEN** RabbitMQ host, port, username, password, and order timeout settings are available from development configuration

## ADDED Requirements

### Requirement: Message consume log table
The system SHALL maintain a `message_consume_log` table with `message_id`, `event_type`, `status`, `error_message`, `create_time`, and `update_time`. `message_id` SHALL be unique.

#### Scenario: Consume log records successful message
- **WHEN** a consumer successfully handles message ID `msg-1001`
- **THEN** `message_consume_log` contains one record for `msg-1001` with status `SUCCESS`

### Requirement: Duplicate message detection
Before executing consumer business logic, the system SHALL check whether the message ID has already been consumed successfully.

#### Scenario: Duplicate successful message is skipped
- **WHEN** a consumer receives message ID `msg-1001` and the consume log status is `SUCCESS`
- **THEN** the consumer acknowledges the message without executing business logic again

### Requirement: Failed message logging
When consumer business logic fails, the system SHALL record the failure status and error message in `message_consume_log` before allowing retry or dead-letter handling.

#### Scenario: Consumer failure is recorded
- **WHEN** the order-timeout consumer fails while processing message ID `msg-1002`
- **THEN** the consume log records status `FAILED` and stores the failure reason

### Requirement: Consumer idempotency applies to all MQ consumers
The system SHALL apply consume-log idempotency to delayed order close, points issuing, and product cache invalidation consumers introduced in this change.

#### Scenario: Every consumer checks consume log
- **WHEN** any MQ consumer receives a message
- **THEN** it checks `message_consume_log` before executing side effects

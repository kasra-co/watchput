# Watchput

[Serveless](http://docs.serverless.com) example of a Lambda task watching an S3 bucket for new files. The purpose of this demo was to troubleshoot issues with AWS that were affecting a larger project.

## Usage

1. Set everything up: `sls dash deploy`. This will create an S3 bucket and a Lambda function subscribed to its createObject events. It's probably free, but it might cost a buck or two per month. Shutdown and cleanup is trivial anyway.
1. In another terminal, `cd` into `lambdas/watchput` and `sls function logs -t` to watch the Lambda function.
1. Invoke the function remotely: `sls function run -d`. Within a few seconds, a log entry should appear, containing the data in `lambdas/watchput/s-event.json`.
1. Trigger an S3 event by uploading a file, such as this readme: `aws s3 cp ./readme.md  s3://serverless-s3-watcher-dev-reports/archive/readme.md`. You should see an S3 event array in the logs.
1. Clean up: `sls project remove`. This should delete all assets that you might have been billed for.

## Discoveries

**Use Serverless function events**, not S3 bucket `NotificationConfiguration`. See event configuration examples buried in the function configuration docs at [http://docs.serverless.com/docs/function-configuration#section-event-sources-examples]().

**Event sources need permission** to trigger a Lambda function; specifically, an `AWS::Lambda::Permission`. This can be configured in the `s-resources-cf.json` CloudFormation template. We can easily grant blacket permissions for an entire service by setting a principal to a service's domain, e.g. `s3.amazonaws.com`, or we can grant permission for only a single bucket to invoke Lambda events. Since the Lambda function configuration selects a bucket to listen to, it is probably redundant to restrict invocation permissions through the Lambda permission. See [ReportsBucketExecLambda](/s-resources-cf.json) for a full example.

**S3 buckets cannot emit events to multiple destinations**, but SNS topics can, and Lambda function can invoke other functions. Either one can be used for an event fanout pattern, as described in this [AWS blog post](https://aws.amazon.com/blogs/compute/fanout-s3-event-notifications-to-multiple-endpoints/). If you get an error while deploying events like:

> Configuration is ambiguously defined. Cannot have overlapping suffixes in two rules if the prefixes are overlapping for the same event type.

then you should suspect that there is already a listener for that bucket.

**Functions and resources must be created before events**, so either run `sls function deploy` and `sls resources deploy` before `sls event deploy` or let `sls dash deploy` handle it all for you.

**Some event types need to be explicitly enabled** by setting `"enabled": true` in their `configuration`. This can be confusing when using `schedule` events for experiments / troubleshooting.

**Use CloudFormation pseudo paramters** in addition to the serverless variables. In particular, the current account ID and region are available as [pseudo parameters](http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/pseudo-parameter-reference.html), but not as serverless variables.

**Read everything quickly and then build shit** Amazon is a jungle. The only way to learn it is to live within it.

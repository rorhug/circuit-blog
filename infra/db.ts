const vpc = new sst.aws.Vpc("MyVpc");
const rds = new sst.aws.Postgres("MyPostgres", { vpc });

export { rds };

import { Resource } from "sst";
import { Example } from "@circuit-blog/core/example";

console.log(
  `${Example.hello()} Linked to ${Resource.MyPostgres.host}. ${
    Resource.MyPostgres.password
  } ${Resource.MyPostgres.username} ${Resource.MyPostgres.database}`
);

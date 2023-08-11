import http from "k6/http";
import { sleep, check } from "k6";
import { Counter, Trend } from "k6/metrics";
import { Rate } from "k6/metrics";

export let errorRate = new Rate("errors");
const myTrend = new Trend("my_trend");

export const options = {
  discardResponseBodies: false,
  scenarios: {
    postQA: {
      executor: "per-vu-iterations",
      vus: 2,
      iterations: 1,
    },
  },
};

export default function () {
  const url = "https://api.funtranslations.com/translate/yoda.json";
  const payload = JSON.stringify({
    text: 'Master Obiwan has lost a planet.'
  });
  const res = http.post(url, payload);
  console.log(res.body);
  let checkRes = check(res, {
    "is status 200": (res) => res.status === 200,
  });

  if (!checkRes) {
    errorRate.add(1);
  }

  myTrend.add(res.timings.connecting, {
    uri: res.request.url,
    method: res.request.method,
    status: res.status,
    response: JSON.stringify(res.body),
  });
}

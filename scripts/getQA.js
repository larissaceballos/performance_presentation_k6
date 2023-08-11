import http from 'k6/http';
import { sleep, check } from 'k6';
import { Counter, Trend } from 'k6/metrics';
import { Rate } from "k6/metrics";

export let errorRate = new Rate("errors");
const myTrend = new Trend('my_trend');

export const options = {
    discardResponseBodies: false,
    scenarios: {
        getQA: {
            executor: 'per-vu-iterations',
            vus: 5,
            iterations: 5,
        },
    },
};

export default function () {
    const url = "https://api.adviceslip.com/advice";
    const res = http.get(url);
    console.log(res.body);
    let checkRes = check(res, {
        'is status 200': (res) => res.status === 200
    });

    if (!checkRes) {
        errorRate.add(1)
    }

    myTrend.add(res.timings.connecting, { uri: res.request.url, method: res.request.method, status: res.status, response: JSON.stringify(res.body)});
}
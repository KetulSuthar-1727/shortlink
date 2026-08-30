import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    vus: 50,
    duration: '30s',
};

export default function () {
    const response = http.get('http://localhost/3', {
        redirects: 0,
    });

    check(response, {
        'status is redirect': (r) => r.status === 302,
    });

    sleep(1);
}
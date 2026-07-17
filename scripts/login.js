import http from 'k6/http';

import parameter from '../framework/parameter.js';

parameter.init("../data/users.csv");

export const options = {

    vus:5,

    iterations:10

};

export default function(){

    let user = parameter.byVU();

    console.log(

        `VU=${__VU} USER=${user.USER_ID}`

    );

    http.post(

        "http://localhost:8080/login",

        JSON.stringify({

            id:user.USER_ID,

            pw:user.PASSWORD

        }),

        {

            headers:{

                "Content-Type":"application/json"

            }

        }

    );

}
import parameter from "../framework/parameter.js";

parameter.load(

    "USER",

    "../data/users.csv"

);

export const options = {

    vus:5,

    iterations:10

};

export default function(){

    const user = parameter.byVU("USER");

    console.log(

        `${__VU} ${__ITER} ${user.USER_ID}`

    );

}

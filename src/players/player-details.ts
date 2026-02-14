import axios from "axios";
import { FinalUserData } from "../interfaces/index.js";

export const getUserDataFromSource = async (token: string, game_id: string
): Promise<FinalUserData | false | undefined > => {
     try {   
        const response = await axios.get(`${process.env.service_base_url}/service/user/detail`, {
            headers: {
                token: token,
                game_id: game_id
            },
        });

        // console.log("Response from admin using axios: ", response)

        const userData : FinalUserData | undefined = response?.data?.user;

        // reference
        console.log("UserData :", userData);
        
        if (userData) {
            // if the value in not valid as URI compo then it converts it into one 
            userData.user_id = encodeURIComponent(userData.user_id);

            const id = `${userData.operatorId}:${userData.user_id}`;
            // console.log(id, "id:oprator_id:user_id");

            const finalData: FinalUserData = {
                ...userData,
                id,
                game_id,
                token,
            }
            return finalData;
        };

        return;

    } catch(error :any) {
        console.error(error);
        return false;
    }
}
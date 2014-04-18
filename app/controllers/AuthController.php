<?php

class AuthController extends BaseController {

	public function authenticate() {
        $response = [
            "meta" => [

            ],
            "data" => [

            ]
        ];

        if (Input::server("REQUEST_METHOD") == "POST") {
            $validator = Validator::make(Input::all(), [
                "username" => "required",
                "password" => "required"
            ]);
            if ($validator->passes()) {
                if (Auth::attempt(array("username" => Input::get("username"), "password" => Input::get("password")))) {
                    $user = Auth::user();
                    $response["meta"]["success"] = true;
                    $response["meta"]["code"] = 700;
                    $response["meta"]["message"] = "Identity successfully authenticated";
                    $response["data"]["username"] = $user->username;
                    $response["data"]["role"] = $user->role;
                    return json_encode($response);
                } else {
                    $response["meta"]["success"] = false;
                    $response["meta"]["code"] = 600;
                    $response["meta"]["message"] = "Identity couldn't be authenticated";
                    $response["data"]["username"] = Input::get("username");
                    return json_encode($response);
                }

            }
            $response["meta"]["success"] = false;
            $response["meta"]["code"] = 601;
            $response["meta"]["message"] = "One or more parameters are missing for authentication to take place";
            return json_encode($response);
        }
        $response["meta"]["success"] = false;
        $response["meta"]["code"] = 302;
        $response["meta"]["message"] = "Forbidden";
        return json_encode($response);
	}
    public function register() {
        $response = [
            "meta" => [

            ],
            "data" => [

            ]
        ];
        if (Input::server("REQUEST_METHOD") == "POST") {
            $validator = Validator::make(Input::all(), [
                "username" => "required",
                "password" => "required",
                "mail" => "required"
            ]);
            if ($validator->passes()) {
                $user = User::attemptRegister(Input::all());
                if ($user) {    // Successfully registered

                } else {        // Couldn't register

                }
            } else {    // Haven't passed validations

            }
        }
    }

}
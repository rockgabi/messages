<?php


class AuthController extends BaseController {

	public function authenticate() {
        $operation = new Messages\Support\Operation('auth-login-op', 'Authentication Login Operation');

        if (Input::server("REQUEST_METHOD") == "POST") {
            $validator = Validator::make(Input::all(), [
                "username" => "required",
                "password" => "required"
            ]);
            if ($validator->passes()) {
                if (Auth::attempt(array("username" => Input::get("username"), "password" => Input::get("password")))) {
                    $user = Auth::user();
                    $operation->assessPoint($operation::INFO, "Identity successfully authenticated", ["id" => $user->id, "username" => $user->username, "role" => $user->role]);
                    return $operation->endOperation()->toJSON();
                } else {
                    $operation->assessPoint($operation::FAILING, "Identity couldn't be authenticated", ["username" => Input::get("username")]);
                    return $operation->endOperation()->toJSON();
                }
            }

            $operation->assesPoint($operation::FAILING, "One or more parameters are missing for authentication to take place");
            return $operation->endOperation()->toJSON();
        }
        $operation->assesPoint($operation::FAILING, "Forbidden");
        return $operation->endOperation()->toJSON();
	}
    public function register() {
        $operation = new Messages\Support\Operation('auth-reg-op', 'Authentication Register Operation');
        if (Input::server("REQUEST_METHOD") == "POST") {
            $validator = Validator::make(Input::all(), [
                "username" => "required",
                "password" => "required"
            ]);
            if ($validator->passes()) {
                $user = User::attemptRegister(Input::all());
                if ($user) {
                    $operation->assessPoint($operation::INFO, "User registered successfully", ["id" => $user->id, "username" => $user->username, "role" => $user->role]);
                    return $operation->endOperation()->toJSON();
                } else {

                }
            }
            $operation->assessPoint($operation::FAILING, "Parameters are missing for registering a user");
            return $operation->endOperation()->toJSON();
        }
        $operation->assessPoint($operation::FAILING, "Forbidden");
        return $operation->endOperation()->toJSON();
    }

}
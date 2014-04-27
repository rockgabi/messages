<?php


class AuthController extends BaseController {

	public function authenticate() {
        $operation = new Messages\Support\Operation('auth-op', 'Authentication Operations');

        if (Input::server("REQUEST_METHOD") == "POST") {
            $validator = Validator::make(Input::all(), [
                "username" => "required",
                "password" => "required"
            ]);
            if ($validator->passes()) {
                if (Auth::attempt(array("username" => Input::get("username"), "password" => Input::get("password")))) {
                    $user = Auth::user();
                    $operation->assessPoint($operation::INFO, "Identity successfully authenticated");
                    $operation->addData(["username" => $user->username, "role" => $user->role]);
                    return $operation->endOperation()->toJSON();
                } else {
                    $operation->assessPoint($operation::FAILING, "Identity couldn't be authenticated");
                    $operation->addData(["username" => Input::get("username")]);
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
        if (Input::server("REQUEST_METHOD") == "POST") {
            User::attemptRegister(Input::all());
        }
    }

}
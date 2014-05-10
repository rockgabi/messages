<?php

class FriendController extends BaseController {


    public function postAction() {
        $params = Input::all();
        $ret = null;
        $operation = new Messages\Support\Operation("put-message", "Request for adding a new message");
        $validator = Validator::make($params, [
            "id" => "required"
        ]);
        if ($validator->passes()){
            $loggedUser = Auth::get();
            if (!$loggedUser) throw new Exception("User to be logged in was expected, but there's none");
            FriendInvitation::addInvitation($loggedUser->id, $params->id);
            $ret = $operation->assessPoint($operation::INFO, "Friend invitation sent")->endOperation()->toJSON();
        } else {
            $ret = $operation->assessPoint($operation::FAILING, "There was a problem sending the invitation")->endOperation()->toJSON();
        }

        $response = Response::make($ret, 200);  // Create the response wrapper
        $response->header("Content-Type", "application/json");  // Modify headers to send JSON explicitly
        return $response;
    }
}
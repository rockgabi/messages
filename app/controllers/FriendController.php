<?php

class FriendController extends BaseController {


    public function postIndex() {
        $params = Input::all();
        $ret = null;
        $operation = new Messages\Support\Operation("send-friend-inv", "Request for sending a friend invitation operation");
        $validator = Validator::make($params, [
            "id" => "required"
        ]);
        if ($validator->passes()){
            $loggedUser = Auth::user();
            if (!$loggedUser) throw new Exception("User to be logged in was expected, but there's none");
            FriendInvitation::addInvitation($loggedUser->id, $params["id"]);
            $ret = $operation->assessPoint($operation::INFO, "Friend invitation sent")->endOperation()->toJSON();
        } else {
            $ret = $operation->assessPoint($operation::FAILING, "There was a problem sending the invitation")->endOperation()->toJSON();
        }

        $response = Response::make($ret, 200);  // Create the response wrapper
        $response->header("Content-Type", "application/json");  // Modify headers to send JSON explicitly
        return $response;
    }

    public function getRecommended() {
        $ret = null;
        $operation = new Messages\Support\Operation("get-rec-friends", "Request getting the recommended friends");

        $loggedUser = Auth::user();
        if (!$loggedUser) throw new Exception("User to be logged in was expected, but there's none");
        $recommended = $loggedUser->getRecommended();

        $ret = $operation->assessPoint($operation::INFO, "Recommendation returned successfully", ["users" => $recommended])->endOperation()->toJSON();
        $response = Response::make($ret, 200);  // Create the response wrapper
        $response->header("Content-Type", "application/json");  // Modify headers to send JSON explicitly
        return $response;
    }
}
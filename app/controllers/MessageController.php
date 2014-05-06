<?php

class MessageController extends BaseController {

    /**
     * Returns the messages for a logged in user
     *
     * @return Messages/Support/Operation
     * @throws Exception    User is not logged in
     */
    public function getIndex() {
        $loggedUser = Auth::user();
        if (!$loggedUser) throw new Exception("User logged in was expected, but there's none");
        $messages = Message::get($loggedUser->id);
        $operation = new Messages\Support\Operation('req-messages', 'Request of messages from user');   // Create Operation Instance
        $ret = $operation->assessPoint($operation::INFO, "Messages returned successfully",
            ["messages" => $messages])->endOperation()->toJSON();    // Pass the operation, and add the message data as JSON
        $response = Response::make($ret, 200);  // Create the response wrapper
        $response->header("Content-Type", "application/json");  // Modify headers to send JSON explicitly
        return $response;
    }

    public function postIndex() {
        $params = Input::all();
        $ret = null;
        $operation = new Messages\Support\Operation("put-message", "Request for adding a new message");
        $loggedUser = Auth::user();
        if (!$loggedUser) throw new Exception("User to be logged in was expected, but there's none");
        $validator = Validator::make($params, [
            "message" => "required"
        ]);

        if ($validator->passes()) {
            $createdMessage = Message::add($loggedUser->id, $params["message"], true);  // Create and get the user info as well in the message
            $ret = $operation->assessPoint($operation::INFO, "Message added successfully", $createdMessage)->endOperation()->toJSON();
        } else {
            $ret = $operation->assessPoint($operation::FAILING, "Message parameter is missing")->endOperation()->toJSON();
        }
        $response = Response::make($ret, 200);  // Create the response wrapper
        $response->header("Content-Type", "application/json");  // Modify headers to send JSON explicitly
        return $response;
    }
}
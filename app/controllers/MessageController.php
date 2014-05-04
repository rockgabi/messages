<?php

class MessageController extends BaseController {

    /**
     * Returns the messages for the current user
     *
     * @return Operation
     */
    public function getIndex(){
        $messages = Message::get(1);
        $operation = new Messages\Support\Operation('req-messages', 'Request of messages from user');   // Create Operation Instance
        $ret = $operation->assessPoint($operation::INFO, "Messages returned successfully",
            ["messages" => $messages])->endOperation()->toJSON();    // Pass the operation, and add the message data as JSON
        $response = Response::make($ret, 200);  // Create the response wrapper
        $response->header("Content-Type", "application/json");  // Modify headers to send JSON explicitly
        return $response;
    }
}
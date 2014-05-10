<?php

class Message extends Eloquent {

    protected $table = "messages";
    protected $guarded = "id";

    /**
     * Returns the messages for a given user
     * 
     * @param null      $user_id
     * @return array    $messages
     */
    public static function get($user_id = null) {
        if (!is_null($user_id))
            $messages = DB::table("messages")
                ->join("users", "messages.user_id", "=", "users.id")
                ->where("user_id", "=", $user_id)
                ->whereIn("user_id", function($query) use ($user_id) {
                    $query->select("user1_id")
                        ->from("friendship")
                        ->where("user2_id", "=", $user_id);
                }, "OR")
                ->whereIn("user_id", function($query) use ($user_id) {
                    $query->select("user2_id")
                        ->from("friendship")
                        ->where("user1_id", "=", $user_id);
                }, "OR")
                ->select("users.id as user_id", "users.username", "users.avatar", "messages.id",
                    "messages.message", "messages.created_at")
                ->get();
        else
            $messages = DB::table("messages")
                ->join("users", "messages.user_id", "=", "users.id")
                ->select("users.id as userId", "users.username", "users.avatar", "messages.id",
                    "messages.message", "messages.created_at")
                ->take(30)
                ->get();
        return $messages;
    }

    /**
     * Creates a new message for a give User
     *
     * @param int $user_id          The user id owner of the new message
     * @param string $message       Message to be put
     * @param bool $userDecorated   Retrieve message decorated with the user information
     * @return array                Newly created message information
     * @throws Exception            If a user id is not given
     */
    public static function add($user_id, $message, $userDecorated = false) {
        if (is_null($user_id))  throw new Exception("A user id must be provided for a new message");
        $createdMessage = new Message();
        $createdMessage->user_id = $user_id;
        $createdMessage->message = $message;
        $createdMessage->save();
        $rawCreatedMessage = $createdMessage->toArray();
        if ($userDecorated) {   // Decorate with user information if requested
            $user = Auth::user();
            $rawCreatedMessage["username"] = $user->username;
            $rawCreatedMessage["avatar"] = $user->avatar;
        }
        return $rawCreatedMessage;
    }

    public static function remove($message_id) {
        $message = Message::find($message_id);
        if ($message) {
            $message->delete();
        }
    }
}
<?php

class Message extends Eloquent {

    protected $table = "messages";
    protected $guarded = "id";

    /**
     * Returns the messages for a given user
     * 
     * @param null $user_id
     * @return array $messages
     */
    public static function get($user_id = null) {
        if (!is_null($user_id))
            //$messages = Message::where("user_id", "=", $user_id)->get();
            $messages = DB::table("messages")
                ->join("users", "messages.user_id", "=", "users.id")
                ->where("user_id", "=", $user_id)
                ->select("users.id", "users.username", "users.avatar", "messages.id as messageId",
                    "messages.message as body", "messages.created_at")
                ->get();
        else
            $messages = Message::all()->take(30)->get();
        return $messages;
    }

}
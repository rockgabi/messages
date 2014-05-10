<?php

use Illuminate\Auth\UserInterface;
use Illuminate\Auth\Reminders\RemindableInterface;

class User extends Eloquent implements UserInterface, RemindableInterface {

    protected $attributes = [
        "avatar" => "http://debates.coches.net/image.php?u=20837&dateline=1189414879"       // Hardcoded since it's just dummy data
    ];

    const DEFAULT_ROLE = "user";
	/**
	 * The database table used by the model.
	 *
	 * @var string
	 */
	protected $table = 'users';

	/**
	 * The attributes excluded from the model's JSON form.
	 *
	 * @var array
	 */
	protected $hidden = array('password');

    protected $guarded = array('id', 'password');

	/**
	 * Get the unique identifier for the user.
	 *
	 * @return mixed
	 */
	public function getAuthIdentifier()
	{
		return $this->getKey();
	}

	/**
	 * Get the password for the user.
	 *
	 * @return string
	 */
	public function getAuthPassword()
	{
		return $this->password;
	}

	/**
	 * Get the e-mail address where password reminders are sent.
	 *
	 * @return string
	 */
	public function getReminderEmail()
	{
		return $this->email;
	}

    /**
     * Attempts to register a new user in the system
     *
     * @param array $userData   is an associative array containing the required fields, username \ password \ mail
     * @return null|User
     * @throws Exception
     */
    public static function attemptRegister($userData = array()){
        $validator = Validator::make($userData, [
            "username"  =>  "required",
            "password"  =>  "required",
            "mail"      =>  "required"
        ]);
        if ($validator->passes()) {
            $user = new User();
            $user->username = $userData["username"];
            $user->password = Hash::make($userData["password"]);
            $user->mail = $userData["mail"];
            $user->role = self::DEFAULT_ROLE;
            $user->save();
            if ($user) {
                return $user;
            }
        } else {
            Throw new Exception("Attempt to register the user failed due to a missing argument [username/password/mail]");
        }
        return null;
    }

    /**
     * Removes a message from this user
     *
     * @param $messageId    is the id of the message to remove
     */
    public function removeMessage($messageId) {
        $message = Message::find($messageId);
        if ($message->user_id == $this->id) {   // Is a message from this user
            $message->delete();     // Delete this model
        }
    }

    public function sendInvitation($user_target_id) {
        FriendInvitation::addInvitation($this->id, $user_target_id);
    }

    public function acceptInvitation($user_target_id) {
        FriendInvitation::acceptInvitation($this->id, $user_target_id);
    }

    /**
     * Returns an array of recommended users for this user
     *
     * @return array    recommended users for this user
     */
    public function getRecommended() {
        $users = User::where("id", "!=", $this->id) // Not this same user
            ->whereNotIn("id", function($query){    // Not in already invited users
                $query->select("user_target_id")
                    ->from("friend_invitation")
                    ->where("user_initiator_id", "=", $this->id);
            }, "AND")
            ->whereNotIn("id", function($query){    // Not in already invited users
                $query->select("user_initiator_id")
                    ->from("friend_invitation")
                    ->where("user_target_id", "=", $this->id);
            }, "AND")
            ->whereNotIn("id", function($query){    // Not in already friend users
                $query->select("user1_id")
                    ->from("friendship")
                    ->where("user2_id", "=", $this->id);
            }, "AND")
            ->whereNotIn("id", function($query){    // Not in already friend users
                $query->select("user2_id")
                    ->from("friendship")
                    ->where("user1_id", "=", $this->id);
            }, "AND")->get();
        return $users->toArray();
    }

    /**
     * Gets the pending invitation for this user
     *
     * @return array    Users which has pending invitations
     */
    public function getInvitations() {
        $users = DB::table("users")
            ->join("friend_invitation", "users.id", "=", "friend_invitation.user_initiator_id")
            ->where("friend_invitation.user_target_id", "=", $this->id)->select("users.*")->get();
        return $users;
    }

}
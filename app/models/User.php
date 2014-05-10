<?php

use Illuminate\Auth\UserInterface;
use Illuminate\Auth\Reminders\RemindableInterface;

class User extends Eloquent implements UserInterface, RemindableInterface {

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

}
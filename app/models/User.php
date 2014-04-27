<?php

use Illuminate\Auth\UserInterface;
use Illuminate\Auth\Reminders\RemindableInterface;

class User extends Eloquent implements UserInterface, RemindableInterface {

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

    public static function attemptRegister($userData){
        $validator = Validator::make($userData, [
            "username"  =>  "required",
            "password"  =>  "required",
            "mail"      =>  "required"
        ]);
        if ($validator.passes()) {
            $user = User::create(["username" => $userData.username, "password", Hash::make($userData.password), "mail" => $userData.mail]);
            if ($user) {
                return [
                    "meta" => [
                        "success" => true,
                        "code" => 710,
                        "message" => "User registered successfully"
                    ],
                    "data" => [
                        "username" => $user->username,
                        "role" => $user->role,
                        "id" => $user->id,
                        "mail" => $user->mail
                    ]
                ];
            }
        }
        return [
            "meta" => [
                "success" => false,
                "code" => 610,
                "message" => "There was a problem registering the user"
            ],
            "data" => []
        ];
    }

}
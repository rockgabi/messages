<?php

class UsersSeeder extends Seeder {

	/**
	 * Run the database seeds.
	 *
	 * @return void
	 */
	public function run()
	{
		$users = [
            [
                "username" => "Admin",
                "role" => "admin",
                "password" => Hash::make("admin"),
                "mail" => 'gabriel.medina@outlook.com',
                "avatar" => "http://debates.coches.net/image.php?u=20837&dateline=1189414879"
            ]
        ];

        foreach($users as $user) {
            User::create($user);
        }
	}

}
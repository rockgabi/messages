<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateFriendInvitationTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create("friend_invitation", function($table){
            $table->increments("id");
            $table->integer("user_initiator_id")->unsigned();
            $table->integer("user_target_id")->unsigned();
            $table->timestamps();
            $table->foreign("user_initiator_id")->references("id")->on("users")
                ->onDelete("cascade");
            $table->foreign("user_target_id")->references("id")->on("users")
                ->onDelete("cascade");
            $table->unique(array("user_initiator_id", "user_target_id"));
        });
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::drop("friend_invitation");
	}

}

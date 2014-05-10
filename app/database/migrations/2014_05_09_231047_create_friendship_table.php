<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateFriendshipTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create("friendship", function($table){
            $table->increments("id");
            $table->integer("user1_id")->unsigned();
            $table->integer("user2_id")->unsigned();
            $table->timestamps();
            $table->foreign("user1_id")->references("id")->on("users")
                ->onDelete("cascade");
            $table->foreign("user2_id")->references("id")->on("users")
                ->onDelete("cascade");
            $table->unique(array("user1_id", "user2_id"));
        });
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::drop("friendship");
	}

}

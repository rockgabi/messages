<?php

class FriendInvitation extends Eloquent {
    protected $table = "friend_invitation";
    protected $guarded = "id";

    /**
     * Stores a friendship invitation
     *
     * @param $userInitiatorId
     * @param $userTargetId
     */
    public static function addInvitation($userInitiatorId, $userTargetId) {
        $invitation = FriendInvitation::getInvitation($userInitiatorId, $userTargetId);
        if (is_null($invitation)) {
            $friendInvitation = new FriendInvitation(); // Instance a new friend invitation
            $friendInvitation->user_initiator_id = $userInitiatorId;
            $friendInvitation->user_target_id = $userTargetId;
            $friendInvitation->save();  // Save the friend invitation
        }
    }

    public static function removeInvitation($userInitiatorId, $userTargetId) {

    }

    /**
     * Accept the invitation of a user to another user
     *
     * @param $userInitiatorId
     * @param $userTargetId
     */
    public static function acceptInvitation($userInitiatorId, $userTargetId) {
        $invitation = FriendInvitation::getInvitation($userInitiatorId, $userTargetId);
        if (!is_null($invitation)) {  // If an invitation exists
            $friendship = new Friendship(); // Instance a new friendship
            $friendship->user1_id = $userInitiatorId;
            $friendship->user2_id = $userTargetId;
            $friendship->save();    // Save the newly created friendship
            $invitation->delete();  // Remove the invitation
        }
    }

    /**
     * Checks if an invitation exists between two users
     *
     * @param $userInitiatorId
     * @param $userTargetId
     * @return bool
     */
    public static function getInvitation($userInitiatorId, $userTargetId) {
        $invitation = FriendInvitation::where("user_initiator_id", "=", $userInitiatorId)
            ->where("user_target_id", "=", $userTargetId, "AND")->first();
        if ($invitation) return $invitation;
        else return null;
    }
}
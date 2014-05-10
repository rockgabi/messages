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
        if (!FriendInvitation::invitationExists($userInitiatorId, $userTargetId)) {
            FriendInvitation::create(array(
                "user_initiator_id" => $userInitiatorId,
                "user_target_id" => $userTargetId
            ));
        }
    }

    public static function removeInvitation($user_initiator, $user_target) {

    }

    /**
     * Checks if an invitation exists between two users
     *
     * @param $userInitiatorId
     * @param $userTargetId
     * @return bool
     */
    public static function invitationExists($userInitiatorId, $userTargetId) {
        $invitation = FriendInvitation::where("user_initiator_id", "=", $userInitiatorId)
            ->where("user_target_id", "=", $userTargetId, "AND");
        if ($invitation) return true;
        else return false;
    }
}
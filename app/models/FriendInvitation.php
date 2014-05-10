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
            $friendInvitation = new FriendInvitation();
            $friendInvitation->user_initiator_id = $userInitiatorId;
            $friendInvitation->user_target_id = $userTargetId;
            $friendInvitation->save();
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
        if ($invitation->count() > 0) return true;
        else return false;
    }
}
<?php
namespace Messages\Support;

class Operation {
    protected $name;
    protected $label;
    protected $messages = [];
    protected $data = [];
    protected $code;
    protected $success;
    protected $exception;
    protected $runningState;

    const FAILING = 'm_failing';
    const WARNING = 'm_warning';
    const INFO = 'm_info';

    const STARTED = 'started';
    const FINISHED = 'finished';

    /**
     * Constructor for the Operation type
     *
     * @param string $name  the name of the operation
     * @param string $label     A friendly displayable name for the operation
     */
    public function __construct($name, $label) {
        $this->name = $name;
        $this->label = $label;
        $this->runningState = self::STARTED;
        $this->success = true;  // Assume success
    }

    /**
     * @param string $assessmentType   [FAILING|WARNING|INFO] the type of the assessment point
     * @param string $message      message of this assessment point
     * @param null $data    data associated with the message
     * @return $this
     */
    public function assessPoint($assessmentType, $message, $data = null) {
        $this->messages[] = ["type" => $assessmentType, "message" => $message];
        $this->success = ($assessmentType == self::FAILING) ? false : $this->success;
        if (!is_null($data)) $this->addData($data);
        return $this;
    }

    public function addData($dataBox) {
        if (!is_array($dataBox)) throw new Exception('Parameter expected to be array');
        foreach($dataBox as $k => $v) {
            $this->addSpecificData($k, $v);
        }
    }

    public function addSpecificData($key, $val) {
        if (isset($this->data[$key])) {
            if (is_array($val))
                $this->data = array_merge($this->data[$key], $val);
            else
                $this->data[$key] = $val;
        }
        else $this->data[$key] = $val;
    }

    public function endOperation() {
        $this->runningState = self::FINISHED;
        return $this;
    }

    public function isFailing() {
        return !$this->success;
    }

    public function isPassing() {
        return $this->success;
    }

    public function hasPassed() {
        return ($this->runningState == self::FINISHED && $this->isPassing());
    }

    public function hasFailed() {
        return ($this->runningState == self::FINISHED && $this->isFailing());
    }

    public function toJSON() {
        $success = $this->isPassing();
        $ret = [
            "meta" => ["success" => $success],
            "data" => $this->data
        ];
        if ($this->isPassing())
            $ret["meta"]["messages"] = $this->getMessages(self::INFO);
        else
            $ret["meta"]["messages"] = $this->getMessages(self::FAILING);
        return json_encode($ret);
    }

    /**
     * Returns the specified messages by type
     *
     * @param string $type    Type of the messages we want, null will return all of them [FAILING\WARNING\INFO]
     * @return array    Matched messages
     */
    public function getMessages($type = null) {
        if ($type != null) {
            $matched = [];
            foreach($this->messages as $message) {
                if ($message["type"] == $type) $matched[] = $message["message"];
            }
            return $matched;
        } else {
            return array_columns(array_values($this->messages), "message");
        }
    }


}
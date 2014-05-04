<?php
Class MessagesSeeder extends Seeder {

    public function run() {
        $messages = [
            [
                "user_id" => "1",
                "message" => "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec tincidunt arcu ac mi faucibus porttitor. Curabitur quis libero ullamcorper metus tincidunt laoreet sed in lorem. Sed gravida arcu sed pharetra sollicitudin. Nulla facilisi. Duis risus dui, aliquam vel blandit eget"
            ],
            [
                "user_id" => "1",
                "message" => "In pulvinar non odio eget tincidunt. Suspendisse vulputate mauris vitae ante vehicula, lacinia rhoncus sem varius"
            ],
            [
                "user_id" => "1",
                "message" => "Donec mauris ligula, congue a egestas quis, volutpat et nulla. In ut lacinia quam. Mauris ultricies arcu non pellentesque imperdiet."
            ],
            [
                "user_id" => "1",
                "message" => "Suspendisse sit amet lorem id sapien sollicitudin placerat. Praesent sagittis quam sed dui cursus porttitor. Mauris accumsan massa a sapien ultrices blandit. Aliquam at lorem nec nibh interdum scelerisque. Aenean adipiscing magna at semper aliquam"
            ]

        ];

        foreach ($messages as $message) {
            Message::create($message);
        }
    }
}
"use client";

import BookPreview from "@/app/components/editor/BookPreview";

export default function PreviewPage({ params }) {

  return (
    <div className="min-h-screen bg-gray-700">
      <div className="flex justify-between px-4 py-1">
        <a href="/write/tool/step2/23/canva/">
        <button
          className="px-2 font-bold py-2 text-sm text-white rounded shadow hover:underline disabled:opacity-70"
        >
          Close 
        </button>
        </a>
        <a href="/write/tool/step2/23">
        <button
          className="px-2 font-bold py-2 text-sm text-white rounded shadow hover:underline disabled:opacity-70"
        >
          Save and Continue 
        </button>
        </a>
      </div>
        <BookPreview
            book={{
            title: "गुनाहों का देवता",
            subtitle: "बिसरिया ने प्रशंसा से मुग्ध होकर देखा मगर फिर एक गर्व का भाव मुँह पर लाकर गम्भीर. हो गया।",
            author: "धर्मवीर भारती ",
            copyright: "This book has been self-published with all reasonable efforts taken by the author to ensure that the material is free from errors. No part of this book may be reproduced, stored, or transmitted in any form or by any means—electronic, mechanical, photocopying, recording, or otherwise—without prior written permission from the author, except in the case of brief quotations embodied in reviews or critical articles. The author of this book is solely responsible and liable for its content, including but not limited to the views, descriptions, statements, representations, opinions, and references (the “Content”). The Content of this book does not constitute, reflect, or imply the views or opinions of Nobel Publishing House, its editors, or its representatives. Neither Nobel Publishing House nor its editors make any guarantees or warranties, express or implied, regarding the reliability, accuracy, or completeness of the Content. This includes, but is not limited to, implied warranties of merchantability or fitness for a particular purpose. Nobel Publishing House and its editors shall not be held liable for any errors, omissions, or inaccuracies in the Content, whether arising from negligence, accident, or any other cause, nor for any claims, losses, or damages of any kind, including but not limited to incidental or consequential damages, arising out of the use or inability to use the information contained herein.",
            chapters: [
                { id: 1, title: "The Shattered Pieces of 2016", content: "<p>This book is dedicated to the quiet moments of reflection, to the unsung heroes of healing, and to the unwavering belief in the possibility of second chances. It’s for those who have felt the sting of heartbreak, the weight of loss, the crushing uncertainty of the unknown. It’s for those who have stumbled and fallen, who have picked themselves up, dusted themselves off, and tried again, even when the odds seemed insurmountable. It’s for those who have found solace in unexpected places, who have discovered strength in vulnerability, who have learned that even in the darkest of nights, a single star can pierce the gloom. This is for those who have loved fiercely and lost deeply, and for those who are still searching, still hoping, still believing that love, in its infinite forms, can bloom again, even from the ashes of what once was. This book is also dedicated to the countless individuals who have shared their stories of heartbreak, resilience, and hope. Your courage, your honesty, your willingness to be vulnerable have inspired me immeasurably. Your journeys, often marked by pain and uncertainty, have served as a powerful reminder of the strength of the human spirit, the capacity for healing, and the enduring power of love. Your stories are not just your own; they resonate with millions, offering solace, validation, and a sense of community to those who feel lost and alone. Thank you for allowing me to bear witness to your journeys, for letting me be a part of your healing process. Your bravery has given voice to the silent struggles of countless others, and for that, I am eternally grateful. This dedication is particularly heartfelt for those who have taught me the lessons woven throughout this story, whether consciously or not. You’ve shown me the importance of empathy, compassion, and understanding in the face of adversity. You’ve demonstrated the strength it takes to confront painful truths, to forgive, and to move forward with hope. You’ve shown me that love is not always easy, that it requires effort, compromise, and unwavering commitment. And, perhaps most importantly, you’ve shown me that even the deepest wounds can heal, leaving behind scars that bear witness to the strength we discovered within ourselves during the process of recovery. Your lessons have shaped me profoundly, and I am grateful for the opportunity to share these hard-earned insights with the world. Thank you for being a part of my life, and for inspiring this story.</p>" },
            ],
            backmatter: "Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of de Finibus Bonorum et Malorum (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, Lorem ipsum dolor sit amet. comes from a line in section 1.10.32. The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from de Finibus Bonorum et Malorum by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.",
            }}
        />
    </div>
  );
}

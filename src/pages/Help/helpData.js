/* ── Shared FAQ data for Help pages ────────────── */

export const CATEGORIES = [
    {
        id: "riders",
        icon: "🚗",
        title: "Riders",
        desc: "Booking, rides, and payments",
        faqs: [
            { q: "How do I request a ride?", a: "Open the UrbanPool app or website, enter your pickup and drop-off locations, choose a ride type, and tap 'See prices'. Select a ride option and confirm your booking. You can also schedule rides up to 7 days in advance for planned trips.", tips: ["Make sure location services are enabled for accurate pickup", "Use landmarks for better pickup precision", "Compare prices across ride types before confirming"] },
            { q: "How can I cancel a ride?", a: "You can cancel a ride from the ride tracking screen before the driver arrives. If cancelled within 2 minutes of requesting, no fee is charged. After that, a small cancellation fee may apply to compensate the driver for their time.", tips: ["Cancel within 2 minutes to avoid fees", "If your driver hasn't moved, contact support for a fee waiver", "Frequent cancellations may affect your rider rating"] },
            { q: "What payment methods are accepted?", a: "We accept Cash, UPI (Google Pay, PhonePe, Paytm), credit/debit cards, and UrbanPool wallet. You can add or change payment methods from your profile settings. Wallet balance is always used first when available.", tips: ["Add a backup payment method in case your primary fails", "UPI payments are instant with no additional charges", "Corporate accounts can use business payment profiles"] },
            { q: "How is the fare calculated?", a: "Fares are based on a combination of base fare, distance traveled, time taken, and current demand (surge pricing, if applicable). You'll always see an upfront estimated price before confirming your ride. The final fare may differ slightly if the route changes.", tips: ["Check estimated price before booking", "Off-peak hours typically have lower fares", "UrbanPool rides are 30-50% cheaper than solo rides"] },
            { q: "I left an item in the car. What do I do?", a: "Go to your trip history → select the ride → tap 'I lost an item'. We'll connect you with your driver directly. A ₹20 return fee may apply for item recovery to cover the driver's time and fuel.", tips: ["Report lost items within 24 hours for best results", "Include a description and photo if possible", "You can also call your driver directly from the trip details screen"] },
        ],
    },
    {
        id: "drivers",
        icon: "🧑‍✈️",
        title: "Drivers",
        desc: "Earnings, schedules, and support",
        faqs: [
            { q: "How do I sign up to drive?", a: "Visit urbanpool.com/drive, submit your documents (license, registration, insurance), and complete the background check. Approval typically takes 3-5 business days. You'll receive an email and SMS when your account is activated.", tips: ["Keep your documents clear and up to date", "Ensure your vehicle meets the minimum requirements", "Complete the training module to unlock Premier rides"] },
            { q: "When do I get paid?", a: "Earnings are deposited to your linked bank account every Monday. You can also use Instant Pay to cash out up to 3 times a day. There's a small processing fee of ₹5 for instant withdrawals.", tips: ["Link a bank account that supports IMPS for faster deposits", "Track your daily earnings in the Driver Dashboard", "Bonuses for completing ride streaks are paid weekly"] },
            { q: "How are driver ratings calculated?", a: "Your rating is the average of your last 500 trips. Riders rate you 1-5 stars after each trip. Maintaining above 4.7 keeps you eligible for Premier rides. Ratings below 4.2 may result in account review.", tips: ["Keep your vehicle clean and well-maintained", "Be polite and offer water or charging cables", "Follow the GPS route unless rider requests otherwise"] },
            { q: "What if a rider damages my vehicle?", a: "Report damage through the app within 48 hours with photos. Our claims team will review and reimburse eligible repair costs within 5-7 business days. Include clear before/after photos and repair estimates.", tips: ["Take photos of your car before each shift as documentation", "Report incidents immediately for faster resolution", "Keep repair receipts for reimbursement processing"] },
        ],
    },
    {
        id: "payments",
        icon: "💳",
        title: "Payments",
        desc: "Wallet, refunds, and billing",
        faqs: [
            { q: "How do I add money to my wallet?", a: "Go to Profile → Wallet → Add Money. You can top up via UPI, debit card, or net banking. Wallet balance is applied automatically to your next ride. Minimum top-up is ₹100 and maximum is ₹10,000.", tips: ["Set up auto-reload to never run out of wallet balance", "Wallet payments are processed instantly — no waiting", "Referral bonus credits are added directly to your wallet"] },
            { q: "How do I request a refund?", a: "Go to your ride history → select the trip → tap 'Review fare'. If there was an overcharge or issue, submit a dispute with details. Refunds are processed within 3-5 business days to your original payment method.", tips: ["Include screenshots or details about the issue", "Refunds for canceled rides are processed within 24 hours", "Wallet refunds are instant; card refunds take 5-7 days"] },
            { q: "Why was I charged a cancellation fee?", a: "A cancellation fee applies when you cancel more than 2 minutes after a driver accepts your request. This compensates the driver for their time and fuel spent heading to your location. The fee varies by city and ride type.", tips: ["Cancel within 2 minutes of requesting to avoid the fee", "If your driver was significantly delayed, the fee may be waived", "Contact support if you believe the charge was unfair"] },
            { q: "Can I split the fare with friends?", a: "Yes! When booking an UrbanPool or UrbanGo ride, tap 'Split fare' before confirming. Enter your friend's phone number or email to split the cost evenly. Both riders need UrbanPool accounts.", tips: ["All participants must have valid payment methods", "You can split with up to 4 people per ride", "The split is calculated after the final fare is determined"] },
        ],
    },
    {
        id: "safety",
        icon: "🔐",
        title: "Safety",
        desc: "Trust, verification, and security",
        faqs: [
            { q: "How does UrbanPool verify drivers?", a: "All drivers undergo government ID verification, criminal background checks, and driving record reviews. Vehicles are inspected annually for safety compliance. We also run periodic re-checks to ensure ongoing safety standards.", tips: ["You can view your driver's ratings before the ride", "All driver documents are verified by our trust team", "Report any concerns immediately via the safety button"] },
            { q: "What safety features are available during a ride?", a: "Live ride tracking, emergency SOS button (connects to local police), real-time trip sharing with trusted contacts, driver identity verification via PIN, audio recording (in supported cities), and 24/7 safety support.", tips: ["Add trusted contacts for automatic trip sharing", "Use the PIN verification feature for night rides", "The SOS button works even without an internet connection"] },
            { q: "How do I share my trip with someone?", a: "During an active ride, tap 'Share trip status'. Choose a contact to share live GPS tracking, driver details, and estimated arrival time via SMS or WhatsApp. You can also set up automatic sharing for all rides.", tips: ["Set up automatic sharing with family members", "Shared contacts can see your live location in real-time", "You can stop sharing at any time during the trip"] },
            { q: "What is the SOS feature?", a: "The SOS button in the ride screen connects you directly to local emergency services. Your live location and trip details are shared automatically with responders. The feature works via cellular network even without internet.", tips: ["The SOS button is always accessible during a ride", "Your emergency contacts are also notified", "Audio recording activates automatically when SOS is triggered"] },
        ],
    },
    {
        id: "account",
        icon: "⚙️",
        title: "Account",
        desc: "Profile, login, and settings",
        faqs: [
            { q: "How do I change my phone number?", a: "Go to Profile → Settings → Phone Number → Update. You'll need to verify the new number via OTP. Your ride history and wallet balance will transfer automatically. The old number will be unlinked after verification.", tips: ["Make sure you have access to the new phone number", "You can only change your number once every 30 days", "Contact support if you've lost access to your current number"] },
            { q: "I forgot my password. How do I reset it?", a: "On the login screen, tap 'Forgot Password'. Enter your registered email and we'll send a reset link valid for 24 hours. You can also reset via OTP to your registered phone number.", tips: ["Check your spam folder if you don't see the reset email", "Use a strong password with at least 8 characters", "Enable biometric login for faster access"] },
            { q: "How do I delete my account?", a: "Go to Profile → Settings → Privacy → Delete Account. Note: this action is permanent. Your ride history, wallet balance, and personal data will be removed within 30 days as per our privacy policy.", tips: ["Download your ride history before deleting", "Any remaining wallet balance will be refunded", "You can create a new account with the same email after 30 days"] },
            { q: "Can I have multiple accounts?", a: "No, each phone number and email can only be linked to one UrbanPool account. Creating duplicate accounts may result in suspension of all associated accounts. If you need a business account, use UrbanPool for Business.", tips: ["Use UrbanPool Business for separate work travel", "Family members should create their own accounts", "Contact support if you accidentally created a duplicate"] },
        ],
    },
];

export const CONTACT_OPTIONS = [
    { icon: "💬", title: "Live Chat", desc: "Chat with our support team", detail: "Available 24/7", action: "Start chat" },
    { icon: "📞", title: "Phone Support", desc: "Talk to a support agent", detail: "1800-123-POOL", action: "Call now" },
    { icon: "📧", title: "Email Us", desc: "Get a response within 24h", detail: "support@urbanpool.com", action: "Send email" },
];

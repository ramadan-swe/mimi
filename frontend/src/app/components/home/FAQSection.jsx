import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { HelpCircle } from 'lucide-react';
export default function FAQSection() {
    return (<div className="bg-white py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 text-blue-600 mb-4">
                        <HelpCircle className="h-6 w-6"/>
                        <span className="font-semibold text-lg">Frequently Asked Questions</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Everything You Need to Know
                    </h2>
                    <p className="text-lg text-gray-600">
                        Learn about our verification process, trial period, and trust system
                    </p>
                </div>

                <Accordion type="single" collapsible className="w-full space-y-4">
                    <AccordionItem value="identity-verification" className="bg-gray-50 rounded-lg px-6 border-0">
                        <AccordionTrigger className="text-left hover:no-underline py-5">
                            <span className="font-semibold text-lg">How does identity verification work?</span>
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-600 pb-5">
                            <p className="mb-3">
                                We use a two-tier verification system to ensure safety for all users:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>
                                    <strong>Automatic Verification (Preferred):</strong> Powered by Veriff, you can verify your identity in minutes using your smartphone. Simply take a photo of your ID and a selfie.
                                </li>
                                <li>
                                    <strong>Manual Upload (Fallback):</strong> If automatic verification isn&apos;t available, you can upload your national ID or passport for manual review by our team (typically 24-48 hours).
                                </li>
                                <li>
                                    <strong>Phone Verification:</strong> All users must verify their phone number via WhatsApp OTP before renting or listing a vehicle.
                                </li>
                            </ul>
                            <p className="mt-3 text-sm italic">
                                Note: Verified users get priority in search results and higher trust scores.
                            </p>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="trial-period" className="bg-gray-50 rounded-lg px-6 border-0">
                        <AccordionTrigger className="text-left hover:no-underline py-5">
                            <span className="font-semibold text-lg">What is the 60-day trial period?</span>
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-600 pb-5">
                            <p className="mb-3">
                                We offer a generous trial period for new hosts to test our platform:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>
                                    <strong>Duration:</strong> 60 days from when you create your first listing
                                </li>
                                <li>
                                    <strong>What&apos;s Included:</strong> List 1 vehicle completely free with full platform features
                                </li>
                                <li>
                                    <strong>No Credit Card Required:</strong> Start immediately without payment information
                                </li>
                                <li>
                                    <strong>One Trial Per Person:</strong> We use national ID verification to ensure fair usage (one trial per Egyptian citizen)
                                </li>
                                <li>
                                    <strong>After Trial:</strong> Upgrade to Premium (5 cars), Agency Silver (15 cars), or Agency Gold (unlimited) to continue
                                </li>
                            </ul>
                            <p className="mt-3 text-sm italic">
                                Pro tip: Use the trial period to optimize your listing, gather reviews, and build your Waseet Score!
                            </p>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="waseet-score" className="bg-gray-50 rounded-lg px-6 border-0">
                        <AccordionTrigger className="text-left hover:no-underline py-5">
                            <span className="font-semibold text-lg">How is the Waseet Score calculated?</span>
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-600 pb-5">
                            <p className="mb-3">
                                The Waseet Score is a 0-100 trust metric that helps renters choose reliable hosts:
                            </p>
                            <div className="space-y-3 ml-4">
                                <div>
                                    <strong className="text-blue-600">Rating (40%):</strong>
                                    <p className="ml-4">Your average star rating from completed rentals. A 5-star average = 40 points.</p>
                                </div>
                                <div>
                                    <strong className="text-green-600">Response Rate (30%):</strong>
                                    <p className="ml-4">How quickly you respond to rental requests. Responding within 2 hours = higher score.</p>
                                </div>
                                <div>
                                    <strong className="text-purple-600">Completion Rate (30%):</strong>
                                    <p className="ml-4">Percentage of accepted rentals that you successfully complete without cancellation.</p>
                                </div>
                            </div>
                            <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border-l-4 border-amber-400">
                                <p className="font-semibold text-amber-900 mb-2">🏆 Score Tiers:</p>
                                <ul className="text-sm space-y-1 ml-4">
                                    <li><span className="font-semibold text-red-600">0-50:</span> New or needs improvement</li>
                                    <li><span className="font-semibold text-yellow-600">51-75:</span> Good standing</li>
                                    <li><span className="font-semibold text-green-600">76-90:</span> Excellent host</li>
                                    <li><span className="font-semibold text-amber-600">91-100:</span> Elite "El-Basha" status 👑</li>
                                </ul>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </div>);
}

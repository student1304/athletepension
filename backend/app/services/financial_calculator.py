"""
Financial calculation service for retirement planning.
"""
from typing import Dict, Any
import math


class FinancialCalculator:
    """
    Service to perform financial calculations for retirement planning.
    """
    
    def __init__(
        self,
        withdrawal_rate: float = 0.04,
        growth_rate_pre_retirement: float = 0.05,
        growth_rate_post_retirement: float = 0.03,
        inflation_rate: float = 0.03,
        tax_rate: float = 0.35
    ):
        self.withdrawal_rate = withdrawal_rate
        self.growth_rate_pre = growth_rate_pre_retirement
        self.growth_rate_post = growth_rate_post_retirement
        self.inflation_rate = inflation_rate
        self.tax_rate = tax_rate
        
        # Calculate after-tax growth rates
        self.after_tax_growth_pre = growth_rate_pre_retirement * (1 - tax_rate)
        self.after_tax_growth_post = growth_rate_post_retirement * (1 - tax_rate)
    
    def calculate_retirement_analysis(
        self,
        current_age: int,
        retirement_age: int,
        current_wealth: float,
        current_income: float,
        monthly_payout_required: float
    ) -> Dict[str, Any]:
        """
        Perform comprehensive retirement analysis.
        
        Args:
            current_age: Current age of the person
            retirement_age: Target retirement age
            current_wealth: Current total wealth/savings
            current_income: Current annual income
            monthly_payout_required: Desired monthly income in retirement
            
        Returns:
            Dictionary containing analysis results and recommendations
        """
        years_to_retirement = retirement_age - current_age
        annual_payout_required = monthly_payout_required * 12
        
        # Calculate required corpus using 4% withdrawal rule
        required_corpus = annual_payout_required / self.withdrawal_rate
        
        # Project current wealth to retirement (with after-tax growth)
        projected_wealth_at_retirement = current_wealth * math.pow(
            (1 + self.after_tax_growth_pre), years_to_retirement
        )
        
        # Calculate the gap
        wealth_gap = required_corpus - projected_wealth_at_retirement
        
        # Calculate required monthly savings
        if wealth_gap > 0:
            # Future value of annuity formula to find monthly savings (after-tax)
            months_to_retirement = years_to_retirement * 12
            monthly_growth_rate = math.pow(1 + self.after_tax_growth_pre, 1/12) - 1
            
            if monthly_growth_rate > 0:
                required_monthly_savings = wealth_gap * monthly_growth_rate / (
                    math.pow(1 + monthly_growth_rate, months_to_retirement) - 1
                )
            else:
                required_monthly_savings = wealth_gap / months_to_retirement
        else:
            required_monthly_savings = 0
        
        # Calculate savings rate as percentage of income
        required_annual_savings = required_monthly_savings * 12
        savings_rate_percentage = (required_annual_savings / current_income * 100) if current_income > 0 else 0
        
        # Calculate years money will last (assuming corpus matches requirement)
        if required_corpus > 0:
            # Monte Carlo simplification: assuming after-tax post-retirement growth offsets some withdrawals
            estimated_years_money_lasts = self._estimate_portfolio_duration(
                required_corpus,
                annual_payout_required,
                self.after_tax_growth_post
            )
        else:
            estimated_years_money_lasts = 30  # Default assumption
        
        # Calculate inflation-adjusted values
        inflation_multiplier = math.pow(1 + self.inflation_rate, years_to_retirement)
        inflation_adjusted_payout = annual_payout_required * inflation_multiplier
        
        # Generate status and recommendations
        is_on_track = wealth_gap <= 0
        feasibility_score = self._calculate_feasibility_score(
            savings_rate_percentage,
            years_to_retirement,
            current_wealth,
            required_corpus
        )
        
        return {
            "inputs": {
                "current_age": current_age,
                "retirement_age": retirement_age,
                "current_wealth": round(current_wealth, 2),
                "current_income": round(current_income, 2),
                "monthly_payout_required": round(monthly_payout_required, 2),
                "annual_payout_required": round(annual_payout_required, 2),
            },
            "projections": {
                "years_to_retirement": years_to_retirement,
                "required_corpus": round(required_corpus, 2),
                "projected_wealth_at_retirement": round(projected_wealth_at_retirement, 2),
                "wealth_gap": round(wealth_gap, 2),
                "required_monthly_savings": round(required_monthly_savings, 2),
                "required_annual_savings": round(required_annual_savings, 2),
                "savings_rate_percentage": round(savings_rate_percentage, 2),
                "estimated_years_money_lasts": round(estimated_years_money_lasts, 1),
                "inflation_adjusted_annual_payout": round(inflation_adjusted_payout, 2),
            },
            "status": {
                "is_on_track": is_on_track,
                "feasibility_score": round(feasibility_score, 2),
                "urgency_level": self._get_urgency_level(savings_rate_percentage, years_to_retirement),
            },
            "assumptions": {
                "withdrawal_rate": self.withdrawal_rate,
                "growth_rate_pre_retirement": self.growth_rate_pre,
                "growth_rate_post_retirement": self.growth_rate_post,
                "inflation_rate": self.inflation_rate,
                "tax_rate": self.tax_rate,
                "after_tax_growth_pre_retirement": self.after_tax_growth_pre,
                "after_tax_growth_post_retirement": self.after_tax_growth_post,
            },
            "recommendations": self._generate_recommendations(
                is_on_track=is_on_track,
                wealth_gap=wealth_gap,
                savings_rate_percentage=savings_rate_percentage,
                years_to_retirement=years_to_retirement,
                current_wealth=current_wealth,
                required_corpus=required_corpus,
                monthly_payout_required=monthly_payout_required,
            )
        }
    
    def _estimate_portfolio_duration(
        self,
        initial_corpus: float,
        annual_withdrawal: float,
        growth_rate: float
    ) -> float:
        """
        Estimate how many years the portfolio will last.
        Simplified calculation assuming constant withdrawals and growth.
        """
        if annual_withdrawal <= 0:
            return 100  # Essentially forever
        
        if growth_rate >= annual_withdrawal / initial_corpus:
            return 100  # Portfolio grows faster than withdrawals
        
        # Simulate year by year
        corpus = initial_corpus
        years = 0
        max_years = 100
        
        while corpus > 0 and years < max_years:
            corpus = corpus * (1 + growth_rate) - annual_withdrawal
            years += 1
        
        return years
    
    def _calculate_feasibility_score(
        self,
        savings_rate: float,
        years_to_retirement: int,
        current_wealth: float,
        required_corpus: float
    ) -> float:
        """
        Calculate a feasibility score (0-100) for the retirement plan.
        """
        score = 100.0
        
        # Penalize high savings rate requirements
        if savings_rate > 50:
            score -= 40
        elif savings_rate > 30:
            score -= 20
        elif savings_rate > 20:
            score -= 10
        
        # Bonus for having time
        if years_to_retirement > 20:
            score += 10
        elif years_to_retirement < 5:
            score -= 20
        
        # Bonus for existing wealth
        if current_wealth > required_corpus * 0.5:
            score += 10
        elif current_wealth < required_corpus * 0.1:
            score -= 10
        
        return max(0, min(100, score))
    
    def _get_urgency_level(self, savings_rate: float, years_to_retirement: int) -> str:
        """Determine urgency level based on required savings rate and timeline."""
        if savings_rate > 40 or years_to_retirement < 5:
            return "critical"
        elif savings_rate > 25 or years_to_retirement < 10:
            return "high"
        elif savings_rate > 15:
            return "moderate"
        else:
            return "low"
    
    def _generate_recommendations(
        self,
        is_on_track: bool,
        wealth_gap: float,
        savings_rate_percentage: float,
        years_to_retirement: int,
        current_wealth: float,
        required_corpus: float,
        monthly_payout_required: float,
    ) -> list[str]:
        """Generate personalized recommendations based on analysis."""
        recommendations = []
        
        if is_on_track:
            recommendations.append(
                f"🎉 Congratulations! You're on track for retirement. Your current wealth of ${current_wealth:,.0f} "
                f"is projected to grow to ${required_corpus:,.0f}, meeting your retirement goal."
            )
            recommendations.append(
                "💡 Continue your current savings strategy and consider diversifying your portfolio."
            )
        else:
            recommendations.append(
                f"📊 Analysis shows you need ${abs(wealth_gap):,.0f} more to reach your retirement goal. "
                f"This requires saving ${savings_rate_percentage:.1f}% of your income annually."
            )
        
        # Savings rate recommendations
        if savings_rate_percentage > 40:
            recommendations.append(
                "⚠️ The required savings rate is very high. Consider: "
                "1) Extending your retirement age, "
                "2) Reducing post-retirement expenses, or "
                "3) Exploring higher-return investment options (with appropriate risk management)."
            )
        elif savings_rate_percentage > 25:
            recommendations.append(
                "💪 This is an aggressive but achievable savings target. "
                "Focus on maximizing your income during peak earning years and minimize unnecessary expenses."
            )
        elif savings_rate_percentage > 15:
            recommendations.append(
                "✅ This is a healthy savings rate. Automate your savings to stay on track."
            )
        
        # Timeline recommendations
        if years_to_retirement < 5:
            recommendations.append(
                "⏰ With less than 5 years to retirement, consider working with a financial advisor "
                "to optimize your strategy and reduce risk in your portfolio."
            )
        elif years_to_retirement < 10:
            recommendations.append(
                "🎯 You have less than a decade to retirement. Start shifting to a more conservative "
                "investment allocation to protect your gains."
            )
        else:
            recommendations.append(
                f"⏳ You have {years_to_retirement} years until retirement - time is on your side! "
                "Consider growth-oriented investments to maximize returns."
            )
        
        # Athlete-specific recommendations
        recommendations.append(
            "🏆 Athlete-specific tip: Consider your career earnings trajectory. "
            "If you're in your peak earning years, maximize savings now. "
            "Also, think about post-career income opportunities (coaching, endorsements, business ventures)."
        )
        
        # Inflation warning
        if years_to_retirement > 10:
            recommendations.append(
                f"📈 Remember: Inflation will increase your costs over time. "
                f"Your ${monthly_payout_required:,.0f}/month today will need to be higher in retirement to maintain the same lifestyle."
            )
        
        return recommendations
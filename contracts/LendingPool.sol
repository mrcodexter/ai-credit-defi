// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title LendingPool
 * @dev A simple lending pool that allows users to borrow funds based on a credit score.
 * In a real scenario, the credit score would be verified via an Oracle or ZK-proof.
 * For this hackathon demo, we use a simplified model.
 */
contract LendingPool {
    struct Loan {
        uint256 amount;
        uint256 repaymentAmount;
        uint256 dueDate;
        bool active;
        bool repaid;
    }

    mapping(address => Loan) public loans;
    mapping(address => uint256) public creditScores;
    
    uint256 public constant INTEREST_RATE = 5; // 5% interest
    uint256 public constant LOAN_DURATION = 30 days;

    event LoanRequested(address indexed borrower, uint256 amount, uint256 repaymentAmount);
    event LoanRepaid(address indexed borrower, uint256 amount);
    event CreditScoreUpdated(address indexed user, uint256 score);

    receive() external payable {}

    /**
     * @dev Updates the credit score of a user. In production, this would be restricted to an AI Oracle.
     */
    function updateCreditScore(address _user, uint256 _score) external {
        require(_score <= 100, "Score must be between 0 and 100");
        creditScores[_user] = _score;
        emit CreditScoreUpdated(_user, _score);
    }

    /**
     * @dev Request a loan based on the credit score.
     * Max loan = score * 0.01 HSK (simplified)
     */
    function requestLoan(uint256 _amount) external {
        require(!loans[msg.sender].active, "Already have an active loan");
        require(creditScores[msg.sender] >= 50, "Credit score too low (min 50)");
        
        uint256 maxLoan = creditScores[msg.sender] * 10**16; // 0.01 HSK per point
        require(_amount <= maxLoan, "Amount exceeds credit limit");
        require(address(this).balance >= _amount, "Insufficient pool liquidity");

        uint256 interest = (_amount * INTEREST_RATE) / 100;
        loans[msg.sender] = Loan({
            amount: _amount,
            repaymentAmount: _amount + interest,
            dueDate: block.timestamp + LOAN_DURATION,
            active: true,
            repaid: false
        });

        payable(msg.sender).transfer(_amount);
        emit LoanRequested(msg.sender, _amount, _amount + interest);
    }

    /**
     * @dev Repay the active loan.
     */
    function repayLoan() external payable {
        Loan storage loan = loans[msg.sender];
        require(loan.active, "No active loan");
        require(msg.value >= loan.repaymentAmount, "Insufficient repayment amount");

        loan.active = false;
        loan.repaid = true;

        emit LoanRepaid(msg.sender, msg.value);
    }

    /**
     * @dev Get pool balance.
     */
    function getPoolBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
